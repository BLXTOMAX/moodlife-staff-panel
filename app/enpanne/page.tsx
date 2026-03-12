import Image from "next/image";

export default function EnPannePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="relative h-[80vh] w-full max-w-5xl">
        <Image
          src="/enpanne.png"
          alt="En panne"
          fill
          className="object-contain"
          priority
        />
      </div>
    </main>
  );
}