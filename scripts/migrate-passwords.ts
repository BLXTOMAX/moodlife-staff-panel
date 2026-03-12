import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabase";

async function migratePasswords() {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, password");

  if (error) {
    console.error("Erreur lecture users:", error);
    return;
  }

  for (const user of users || []) {
    if (typeof user.password === "string" && !user.password.startsWith("$2")) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("id", user.id);

      if (updateError) {
        console.error(`Erreur update ${user.email}:`, updateError);
      } else {
        console.log(`Mot de passe migré pour ${user.email}`);
      }
    }
  }

  console.log("Migration terminée.");
}

migratePasswords();