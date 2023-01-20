import Image from "next/image";
import { Inter } from "@next/font/google";
import CryptoDevsDAO from "../components/CryptoDevsDAO";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <CryptoDevsDAO />
    </>
  );
}
