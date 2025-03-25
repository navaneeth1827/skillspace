
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create avatars bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(
      "avatars",
      {
        public: true,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"],
        fileSizeLimit: 2097152, // 2MB
      }
    );

    if (bucketError && !bucketError.message.includes("already exists")) {
      throw bucketError;
    }

    // Create storage policy for the avatars bucket
    const { error: policyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'avatars',
      policy_name: 'Avatar Public Access Policy',
      definition: 'true',
      operation: 'SELECT'
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Avatars bucket created successfully",
        bucket: bucketData || "already exists"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
