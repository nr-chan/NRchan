package utils

import (
	"fmt"
	"io"
	"math"

	"github.com/syumai/workers/cloudflare/r2"
)

const IMAGE_SUBDOMAIN = "https://images.friedpotato.in/"

const (
	thumbMaxWidth  = 250
	thumbMaxHeight = 250
)

type ImageBucketInterface interface {
	Post(key string, body io.ReadCloser, contentType string) error
	Get(key string) (*r2.Object, error)
	Delete(key string) error
}

type ImageBucket struct {
	bucket *r2.Bucket
}

func NewImageBucket(bucketName string) *ImageBucket {
	bucket, err := r2.NewBucket(bucketName)

	if err != nil {
		return nil
	}

	return &ImageBucket{
		bucket: bucket,
	}
}

func (s *ImageBucket) Post(key string, body io.ReadCloser, contentType string) (string, error) {
	_, err := s.bucket.Put(key, body, &r2.PutOptions{
		HTTPMetadata: r2.HTTPMetadata{
			ContentType: contentType,
		},
	})

	imageURL := IMAGE_SUBDOMAIN + key
	if err != nil {
		return imageURL, err
	}

	return imageURL, nil
}

func (s *ImageBucket) Get(key string) (*r2.Object, error) {
	// get image url from R2
	imgObj, err := s.bucket.Get(key)
	if err != nil {
		return nil, err
	}
	if imgObj == nil {
		return nil, fmt.Errorf("image not found: %s", key)
	}

	return imgObj, nil
}

func (s *ImageBucket) Delete(key string) error {
	// delete image object from R2
	if err := s.bucket.Delete(key); err != nil {
		return fmt.Errorf("failed to delete R2Object\n", err)
	}
	return nil
}

func NormalizeScale(w, h int) float64 {
	if w == 0 || h == 0 {
		return 1
	}

	scaleW := float64(thumbMaxWidth) / float64(w)
	scaleH := float64(thumbMaxHeight) / float64(h)

	// Choose the smaller scale so both dimensions fit
	scale := math.Min(scaleW, scaleH)

	// Never upscale small images
	if scale > 1 {
		return 1
	}

	return scale
}
