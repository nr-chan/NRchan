package utils

import (
	"fmt"
	"io"

	"github.com/syumai/workers/cloudflare/r2"
)

type ImageBucketInterface interface {
	Post(key string, body io.ReadCloser, contentType string) error
	Get(key string) (*r2.Object, error)
	Delete(key string) error
}

type ImageBucket struct {
	bucket *r2.Bucket
}

func NewImageBucket(bucketName string) ImageBucketInterface {
	bucket, err := r2.NewBucket(bucketName)

	if err != nil {
		return nil
	}

	return &ImageBucket{
		bucket: bucket,
	}
}

func (s *ImageBucket) Post(key string, body io.ReadCloser, contentType string) error {

	objects, err := s.bucket.List()
	if err != nil {
		return err
	}
	for _, obj := range objects.Objects {
		if obj.Key == key {
			return fmt.Errorf("key %s already exists", key)
		}
	}
	_, err = s.bucket.Put(key, body, &r2.PutOptions{
		HTTPMetadata: r2.HTTPMetadata{
			ContentType: contentType,
		},
	})
	if err != nil {
		return err
	}

	return nil
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
