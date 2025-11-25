import { config, openingHours } from '@/data/config';

const dayNames = ['Ne', 'Po', 'Ut', 'St', 'Ct', 'Pa', 'So'];

export function Footer() {
  return (
    <footer id="kontakt" className="bg-bread-dark text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* O nás */}
          <div>
            <h3 className="text-xl font-bold mb-4">🍞 {config.name}</h3>
            <p className="text-bread-light opacity-80 mb-4">
              {config.description}
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-xl font-bold mb-4">Kontakt</h3>
            <div className="space-y-2 text-bread-light opacity-80">
              <p>📍 {config.address}</p>
              <p>📞 {config.phone}</p>
              <p>✉️ {config.email}</p>
              <p>
                <a
                  href={config.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  📷 Instagram
                </a>
              </p>
            </div>
          </div>

          {/* Otevírací doba */}
          <div>
            <h3 className="text-xl font-bold mb-4">Otevírací doba</h3>
            <div className="space-y-1 text-bread-light opacity-80">
              {openingHours.map((hours, index) => (
                <div key={index} className="flex justify-between">
                  <span>{dayNames[hours.day]}</span>
                  <span>
                    {hours.closed ? 'Zavřeno' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-bread-medium mt-8 pt-8 text-center text-bread-light opacity-60">
          <p>&copy; {new Date().getFullYear()} {config.name}. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </footer>
  );
}
