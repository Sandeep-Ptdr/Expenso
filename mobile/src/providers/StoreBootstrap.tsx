import { PropsWithChildren, useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export default function StoreBootstrap({ children }: PropsWithChildren) {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return children;
}
