FROM amazoncorretto:17
EXPOSE 8081
ADD target/matchy_sub-0.0.1-SNAPSHOT.jar msSubscription.jar
ENTRYPOINT ["java", "-jar","msSubscription.jar"]