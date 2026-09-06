// Package realtime reproduces the legacy socket.io bridge (Phase 3): the
// FoundryVTT (VicarTT) dice bridge and the GM `fx` effect triggers. It speaks
// socket.io v4 so both the unchanged web frontend (socket.io-client) and the
// external Foundry module keep working after the Bun→Go cutover.
package realtime

import (
	"context"
	"net/http"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/zishang520/socket.io/v2/socket"
)

// allowedFx mirrors the legacy whitelist of GM-triggerable effects.
var allowedFx = map[string]bool{
	"frenzy": true, "hungerSpike": true, "messyCrit": true, "bestialFail": true, "critSuccess": true,
}

type Hub struct {
	io    *socket.Server
	store storage.Provider
	auth  *auth.Service
}

func New(store storage.Provider, authSvc *auth.Service) *Hub {
	h := &Hub{io: socket.NewServer(nil, nil), store: store, auth: authSvc}
	h.io.On("connection", h.onConnect)
	return h
}

// Handler serves the socket.io endpoint (mount it at /socket.io/*).
func (h *Hub) Handler() http.Handler { return h.io.ServeHandler(nil) }

// Close shuts the socket.io server down.
func (h *Hub) Close() { h.io.Close(nil) }

func (h *Hub) onConnect(clients ...any) {
	s := clients[0].(*socket.Socket)

	// FoundryVTT (VicarTT) authenticates via the fvttToken in the handshake auth.
	if token := fvttToken(s.Handshake().Auth); token != "" {
		user, err := h.store.Users().FindByFvttToken(context.Background(), token)
		if err != nil || user == nil {
			s.Disconnect(true)
			return
		}
		uid := user.IDHex()
		s.Join(socket.Room("fvtt:" + uid))
		_ = s.Emit("fvtt-authenticated")

		// FVTT heartbeat / roll result → the user's web clients.
		s.On("fvtt-heartbeat", func(...any) {
			h.io.To(socket.Room("web:" + uid)).Emit("fvtt-heartbeat")
		})
		s.On("fvtt-roll-result", func(args ...any) {
			h.io.To(socket.Room("web:"+uid)).Emit("fvtt-roll-result", first(args))
		})
		return
	}

	// Web frontend authenticates via the access JWT sent in an `authenticate` event.
	s.On("authenticate", func(args ...any) {
		token, _ := first(args).(string)
		user := h.auth.Authenticated(context.Background(), token)
		if user == nil {
			s.Disconnect(true)
			return
		}
		uid := user.IDHex()
		s.Join(socket.Room("web:" + uid))

		// Web dice-pool roll → the user's FVTT clients.
		s.On("fvtt-roll", func(a ...any) {
			h.io.To(socket.Room("fvtt:"+uid)).Emit("fvtt-roll", first(a))
		})
		// GM effect trigger (only for characters the user owns/views, or admin).
		s.On("fx-trigger", func(a ...any) {
			h.handleFxTrigger(user.IDHex(), user.IsAdmin, first(a))
		})
	})
}

func (h *Hub) handleFxTrigger(userID string, isAdmin bool, payload any) {
	m, ok := payload.(map[string]any)
	if !ok {
		return
	}
	characterID, _ := m["characterId"].(string)
	kind, _ := m["kind"].(string)
	if characterID == "" || !allowedFx[kind] {
		return
	}

	ctx := context.Background()
	char, err := h.store.Characters().GetForRead(ctx, characterID, userID)
	if err != nil {
		if !isAdmin {
			return
		}
		char, err = h.store.Characters().Get(ctx, characterID)
		if err != nil {
			return
		}
	}
	h.io.To(socket.Room("web:"+char.UserID)).Emit("fx", map[string]any{"kind": kind})
}

func fvttToken(authObj any) string {
	m, ok := authObj.(map[string]any)
	if !ok {
		return ""
	}
	t, _ := m["fvttToken"].(string)
	return t
}

func first(args []any) any {
	if len(args) > 0 {
		return args[0]
	}
	return nil
}
