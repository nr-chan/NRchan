package service

import (
	"encoding/json"

	"github.com/syumai/workers/cloudflare/kv"
)

type CacheService interface {
	Get(key string, value any) error
	Set(key string, value any) error
	Delete(key string) error
}

type cacheService struct {
	namespace *kv.Namespace
	TTL       int
}

func NewCacheService(nsName string) CacheService {
	nameSpace, err := kv.NewNamespace(nsName)
	if err != nil {
		return nil
	}
	return &cacheService{namespace: nameSpace, TTL: 60 * 60} // HardCoded for now
}

func (c *cacheService) Get(key string, value any) error {

	data, err := c.namespace.GetString(key, nil)
	if err != nil {
		return err
	}

	if err := json.Unmarshal([]byte(data), value); err != nil {
		return err
	}

	return nil
}

func (c *cacheService) Set(key string, value any) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return c.namespace.PutString(key, string(data), &kv.PutOptions{
		ExpirationTTL: c.TTL,
	})
}

func (c *cacheService) Delete(key string) error {
	return c.namespace.Delete(key)
}
