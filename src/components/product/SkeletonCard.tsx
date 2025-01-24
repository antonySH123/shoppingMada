import React from 'react'
import Skeleton from 'react-loading-skeleton'

const SkeletonCard : React.FC =() =>{
  return (
    <div className="card shadow-lg h-auto pb-5 w-full rounded-lg bg-gray-100">
      <div className="bg-gray-100 px-3 pt-3">
        <Skeleton height={150} />
      </div>
      <div className="mt-2 mb-3 px-4">
        <Skeleton width={"80%"} height={20} />
        <Skeleton width={"60%"} height={15} />
      </div>
      <div className="px-4 flex gap-2">
        <Skeleton width={"50%"} height={40} />
        <Skeleton width={"50%"} height={40} />
      </div>
    </div>
  )
}

export default SkeletonCard