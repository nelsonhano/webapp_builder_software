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

        <p className="text-center">
          Run your agency, in one place
        </p>
    </section>
  );
}
