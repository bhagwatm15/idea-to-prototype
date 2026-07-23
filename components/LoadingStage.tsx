export default function LoadingStage({ copy }: { copy: string }) {
  return (
    <div className="shell">
      <div className="loading-block">
        <div className="spinner" />
        <p className="loading-copy">{copy}</p>
      </div>
    </div>
  );
}
