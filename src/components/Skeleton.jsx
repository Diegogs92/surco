export function Skeleton({ className = '', width, height, variant = 'rectangular' }) {
  const styles = {
    width: width || '100%',
    height: height || (variant === 'circular' ? '40px' : '20px'),
  }

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={styles}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height="16px"
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card ${className}`}>
      <Skeleton width="40%" height="20px" className="skeleton-mb-8" />
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="table-row">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              width={colIndex === 0 ? '120px' : '80%'}
              height="16px"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
