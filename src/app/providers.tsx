"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SSRProvider } from "react-bootstrap";
import { ReactNode } from "react";

// Chakra UI 테마 설정
const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },
  colors: {
    primary: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3",
      600: "#1e88e5",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
  },
  fonts: {
    heading: "Pretendard",
    body: "Pretendard",
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SSRProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </SSRProvider>
  );
}
