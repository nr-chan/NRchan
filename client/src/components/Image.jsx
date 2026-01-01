import React, { useState } from 'react'
import { getFileSize, getSmallImageUrl } from '../Defs'

const ThreadImage = ({ imageData, allowExpand = true }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!imageData) {
    return null
  }

  if (!allowExpand) {
    return (
      <div className="pr-2">
        <img
          src={getSmallImageUrl(imageData.url)}
          alt={`${getFileSize(imageData.size)}`}
          className='object-contain'
          style={{
            maxWidth: '100%',
            width: 'auto',
            height: 'auto',
            maxHeight: '350px'
          }}
          loading='lazy'
        />
      </div>
    )
  }

  return (
    <a
      href={imageData.url}
      onClick={(e) => {
        e.preventDefault()
        setIsExpanded(!isExpanded)
      }}
      className='inline-block cursor-pointer pr-2'
    >
      {!isExpanded
        ? (
          <img
            src={getSmallImageUrl(imageData.url)}
            alt={`${getFileSize(imageData.size)}`}
            className='border object-contain'
            style={{
              maxWidth: '100%',
              width: 'auto',
              height: 'auto'
            }}
            loading='lazy'
          />
          )
        : (
          <>
            <img
              src={getSmallImageUrl(imageData.url)}
              alt={`${getFileSize(imageData.size)}`}
              className='border hidden pr-2'
            />
            <img
              src={imageData.url}
              alt={`${getFileSize(imageData.size)}`}
              className='border object-contain'
              style={{
                width: 'auto',
                height: 'auto'
              }}
            />
          </>
          )}
    </a>
  )
}

export default ThreadImage
