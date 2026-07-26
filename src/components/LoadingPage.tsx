type LoadingPageProps = {
  visible: boolean
  progress: number
}

export const LoadingPage = ({ visible, progress }: LoadingPageProps) => {
  return (
    <section className={`loading-page ${visible ? 'visible' : 'hidden'}`} aria-live="polite">
      <div className="loading-page-inner">
        <p className="loading-kicker">St. Stephen's College</p>
        <h1>SSC Atlas</h1>
        <p className="loading-caption">Preparing campus experience</p>

        <div className="loading-meter" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress / 100))})` }} />
        </div>

        <p className="loading-percent">{Math.round(progress)}%</p>
      </div>
    </section>
  )
}
