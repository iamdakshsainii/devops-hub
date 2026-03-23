"use client";

import EditModulePage from "../[id]/page";

export default function NewModulePage() {
  // Directly reuse the fully featured controller view
  return <EditModulePage params={Promise.resolve({ id: "new" })} />;
}
