import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "react-hot-toast";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <CookiesProvider>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 1000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: 'green',
              },
            },
            error: {
              style: {
                background: '#ff4d4f',
              },
            },
          }}
        />
        {children}
      </HeroUIProvider>
    </CookiesProvider>
  );
}
