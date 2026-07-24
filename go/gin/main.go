package main

import (
	"github.com/gin-gonic/gin"
	"os"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) { c.JSON(200, gin.H{"service": "Pxxl Gin API"}) })
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
	r.GET("/api", func(c *gin.Context) { c.JSON(200, gin.H{"message": "Hello from Gin"}) })
	p := os.Getenv("PORT")
	if p == "" {
		p = "8080"
	}
	r.Run("0.0.0.0:" + p)
}
