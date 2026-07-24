package main

import (
	"github.com/labstack/echo/v4"
	"os"
)

func main() {
	e := echo.New()
	e.GET("/", func(c echo.Context) error { return c.JSON(200, map[string]string{"service": "Pxxl Echo API"}) })
	e.GET("/health", func(c echo.Context) error { return c.JSON(200, map[string]string{"status": "ok"}) })
	e.GET("/api", func(c echo.Context) error { return c.JSON(200, map[string]string{"message": "Hello from Echo"}) })
	p := os.Getenv("PORT")
	if p == "" {
		p = "8080"
	}
	e.Start("0.0.0.0:" + p)
}
