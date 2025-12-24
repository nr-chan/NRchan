package provider

import (
	"github.com/nr-chan/NRchan/repository"
)

type RepositoryContainer struct {
	boardRepository  repository.BoardRepository
	homeRepository   repository.HomeRepository
	threadRepository repository.ThreadRepository
	replyRepository  repository.ReplyRepository
}

func RegisterRepositories(data *DatabaseProvider) RepositoryContainer {
	return RepositoryContainer{
		boardRepository:  repository.NewBoardRepository(data.database),
		homeRepository:   repository.NewHomeRepository(data.database),
		threadRepository: repository.NewThreadRepository(data.database),
		replyRepository:  repository.NewReplyRepository(data.database),
	}
}
