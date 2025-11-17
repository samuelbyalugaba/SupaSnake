import Navbar from './Navbar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center px-6">
        <Navbar />
      </div>
    </header>
  );
}
