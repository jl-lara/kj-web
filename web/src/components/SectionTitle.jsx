export default function SectionTitle({ eyebrow, title, text, align = 'left' }) {
  return (
    <div className={`section-title ${align === 'center' ? 'center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
