package main

import (
	"fmt"
	"net/http"

	"github.com/Arj-Patel/RSS-Aggregator/internal/auth"
	"github.com/Arj-Patel/RSS-Aggregator/internal/database"
)

type authHandler func(http.ResponseWriter, *http.Request, database.User) // Add this line to define the type authHandler

func (cfg *apiConfig) middlewareAuth(handler authHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		apiKey, err := auth.GetAPIKey(r.Header)
		if err != nil {
			respondWithErr(w, 403, fmt.Sprintf("Auth error: %v", err))
			return
		}

		user, err := cfg.DB.GetUserByAPIKey(r.Context(), apiKey)
		if err != nil {
			respondWithErr(w, 400, fmt.Sprintf("Couldn't get user: %v", err))
			return
		}

		handler(w, r, user)
	}
}
