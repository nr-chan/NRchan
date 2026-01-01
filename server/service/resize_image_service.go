package service

import (
	"context"
	"fmt"
	"net/http"

	"github.com/syumai/workers/cloudflare/fetch"
)

type ResizeImageService interface {
	ResizeImage(ctx context.Context, key string, scale float64) error
}

type resizeImageService struct {
	externalURL string
}

func NewResizeImageService(externalURL string) ResizeImageService {
	return &resizeImageService{externalURL: externalURL}
}

func (s *resizeImageService) ResizeImage(
	ctx context.Context,
	key string,
	scale float64,
) error {
	url := fmt.Sprintf(
		"%s/resize?key=%s&scale=%f",
		s.externalURL,
		key,
		scale,
	)

	cli := fetch.NewClient()
	req, err := fetch.NewRequest(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}

	res, err := cli.Do(req, nil)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf(
			"resize image failed: status=%d",
			res.StatusCode,
		)
	}

	return nil
}
