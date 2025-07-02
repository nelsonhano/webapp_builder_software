import Image from "next/image";

export default function Home() {
  return (
    <section className="relative h-screen w-full pt-36 flex items-center flex-col justify-center bg-white text-black overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00000088 1px, transparent 1px),
            linear-gradient(to bottom, #00000088 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, #000 85%, transparent 120%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, #000 85%, transparent 120%)',
        }}
      />

      <div className="flex flex-col w-full px-10 justify-center items-center">
        <p className="text-center">Run your agency, in one place</p>
        <div className="flex flex-col w-full justify-center items-center">
          <h1 className="text-9xl">Plura.</h1>
          <div className="relative w-3/4 h-1/2">
            {/* <Image
              src="/dashboard.png"
              alt="dashboard"
              fill
              className="object-contain rounded-2xl shadow-xl"
            /> */}
            {/* <Image src="/dashboard.png" alt="dashboard" className="mx-auto w-[1200px]" width={100} height={100} /> */}
          </div>

        </div>
      </div>

      <div className="flex flex-col w-full mt-10">
        <h1 className="text-6xl text-center">Choose what fit you</h1>
      </div>
    </section>
  );
}
