package provider

import (
	"github.com/nr-chan/NRchan/repository"
	"github.com/samber/do"
)

func RegisterRepositories(injector *do.Injector) {
	// User Repository
	do.ProvideNamed(injector, "BoardRepository", func(i *do.Injector) (repository.BoardRepository, error) {
		dbProvider := do.MustInvokeNamed[*DatabaseProvider](i, "DatabaseProvider")
		return repository.NewBoardRepository(dbProvider.database), nil
	})

	do.ProvideNamed(injector, "HomeRepository", func(i *do.Injector) (repository.HomeRepository, error) {
		dbProvider := do.MustInvokeNamed[*DatabaseProvider](i, "DatabaseProvider")
		return repository.NewHomeRepository(dbProvider.database), nil
	})

	// do.ProvideNamed(injector, "ThreadRepository", func(i *do.Injector) (repository.ThreadRepository, error) {
	// 	dbProvider := do.MustInvokeNamed[*DatabaseProvider](i, "DatabaseProvider")
	// 	return repository.NewThreadRepository(dbProvider.database), nil
	// })
}
