import { db } from "./firebase";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import {
  MOCK_MENU_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_TABLES,
} from "@pedeform/shared";

export async function seedFirebase() {
  const batch = writeBatch(db);

  console.log("Seeding Categorias...");
  for (const cat of MOCK_MENU_CATEGORIES) {
    const ref = doc(db, "categorias", cat.id);
    batch.set(ref, cat);
  }

  console.log("Seeding Cardápio...");
  for (const item of MOCK_MENU_ITEMS) {
    const ref = doc(db, "cardapio", item.id);
    batch.set(ref, item);
  }

  console.log("Seeding Mesas...");
  for (const table of MOCK_TABLES) {
    const ref = doc(db, "mesas", table.id);
    batch.set(ref, table);
  }

  await batch.commit();
  console.log("Firebase seeded successfully!");
}
