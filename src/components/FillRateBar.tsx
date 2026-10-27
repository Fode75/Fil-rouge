interface FillRateBarProps {
  current: number;
  max: number;
}

export default function FillRateBar({ current, max }: FillRateBarProps) {
  // Calcul du pourcentage (limité à 100 maximum)
  const percentage = Math.min(Math.round((current / max) * 100), 100);
  
  // Changement dynamique de la couleur de la barre
  const barColor = 
    percentage >= 100 ? 'bg-red-500' : 
    percentage >= 80 ? 'bg-orange-500' : 
    'bg-emerald-500';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="text-slate-500 font-medium">Taux de remplissage</span>
        <span className="text-slate-800 font-bold">{current} / {max} places</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}