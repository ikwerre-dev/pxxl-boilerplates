plugins { kotlin("jvm") version "2.1.21"; application }
repositories { mavenCentral() }
dependencies { implementation("io.ktor:ktor-server-netty:3.1.3"); implementation("io.ktor:ktor-server-content-negotiation:3.1.3"); implementation("io.ktor:ktor-serialization-kotlinx-json:3.1.3") }
application { mainClass.set("dev.pxxl.ApplicationKt") }
