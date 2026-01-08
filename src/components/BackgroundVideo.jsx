function BackgroundVideo() {
  return (
    <div className="app-background" aria-hidden="true">
      <video autoPlay muted loop playsInline preload="auto">
        <source src="/0_Wheat_Field_Grain_3840x2160.mp4" type="video/mp4" />
      </video>
      <div className="app-overlay" />
    </div>
  )
}

export default BackgroundVideo
