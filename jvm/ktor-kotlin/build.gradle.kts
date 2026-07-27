plugins { kotlin("jvm") version "2.1.21"; application }
repositories { mavenCentral() }
dependencies { implementation("io.ktor:ktor-server-netty:3.1.3"); implementation("io.ktor:ktor-server-content-negotiation:3.1.3"); implementation("io.ktor:ktor-serialization-kotlinx-json:3.1.3") }
application { mainClass.set("dev.pxxl.ApplicationKt") }
tasks.jar { manifest { attributes["Main-Class"]="dev.pxxl.ApplicationKt" }; duplicatesStrategy=DuplicatesStrategy.EXCLUDE; from(configurations.runtimeClasspath.get().map { if (it.isDirectory) it else zipTree(it) }) }
