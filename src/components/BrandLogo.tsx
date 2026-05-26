interface BrandLogoProps {
  compact?: boolean;
  inverse?: boolean;
}

export function BrandLogo({ compact = false, inverse = false }: BrandLogoProps) {
  return (
    <div className={`brand-logo ${compact ? 'brand-logo-compact' : ''} ${inverse ? 'brand-logo-inverse' : ''}`}>
      <img src="/newlogo.png" alt="RPA logo" className="brand-logo-image" />
      {!compact ? (
        <div>
          <p className="brand-logo-kicker">RPA</p>
          <strong>NGO Fund Platform</strong>
        </div>
      ) : null}
    </div>
  );
}
