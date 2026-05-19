import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/60 mt-auto">
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <img src="/stellantislogo.png" alt="Stellantis" className="h-6 w-auto object-contain" />
            </div>
            <span className="text-sm font-bold ml-1">QA Matrix</span>
            <span className="text-xs text-muted-foreground">— QCP Smart Projects (Quality Assurance Control & Monitoring)</span>
          </div>
          <nav className="flex items-center gap-6 text-xs">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Matrix
            </Link>
            <Link to="/defect-upload" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Defect Upload
            </Link>
            <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              How It Works
            </Link>
          </nav>
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} QA Matrix System · QCP Smart Projects
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
