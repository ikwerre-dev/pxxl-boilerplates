package main

import (
	"github.com/gofiber/fiber/v2"
	"os"
)

func main() {
	a := fiber.New()
	a.Get("/", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"service": "Pxxl Fiber API"}) })
	a.Get("/health", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"status": "ok"}) })
	a.Get("/api", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"message": "Hello from Fiber"}) })
	p := os.Getenv("PORT")
	if p == "" {
		p = "8080"
	}
	a.Listen("0.0.0.0:" + p)
}
