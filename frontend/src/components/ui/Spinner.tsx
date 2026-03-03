export default function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="border-[3px] border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"
    />
  );
}
