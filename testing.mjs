import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://uryyymxvxqosudfonxws.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXl5bXh2eHFvc3VkZm9ueHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMwNzE3MjQsImV4cCI6MjAwODY0NzcyNH0.4qXsICshGCgo3z37aIl-nUOVB9_PFpshRM8lVeQ6GQ4"
);

async function getUserWithMessages() {
  const { data: userWithMessages, error } = await supabase
    .from("users")
    .select("*, messages(*)")
    .eq("userid", "marko")
    .join("messages", { foreignKey: "userid" });

  if (error) {
    console.error(error);
    return;
  }

  console.log(userWithMessages);
}
