"use client";

import { Box, Image, useColorModeValue, chakra } from "@chakra-ui/react";
import { Course, Destination } from "@/types";
import { getCityImage } from "@/utils/imageUtils";

interface Props {
  course: Course;
  destination: Destination;
  index?: number;
}

export default function CourseCard({ course, destination, index }: Props) {
  const isNew = true;

  return (
    <Box
      bg={useColorModeValue("white", "gray.700")}
      borderWidth="1px"
      borderLeftWidth="4px"
      borderLeftColor="purple.400"
      rounded="lg"
      shadow="md"
      overflow="hidden"
      position="relative"
      minHeight="380px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      _hover={{
        shadow: "lg",
        transform: "translateY(-4px)",
        transition: "0.2s",
      }}
    >
      {/* 썸네일: destination의 이미지 사용 */}
      <Image
        src={
          destination.destinationThumbnailImageUrl ||
          course.thumbnailUrl ||
          getCityImage(course.area)
        }
        alt={course.title}
        objectFit="cover"
        w="100%"
        h="300px"
      />
      {/* 카드 본문 */}
      <Box p="4" height="150px">
        <chakra.h3
          fontSize="1.5em"
          fontWeight="bold"
          noOfLines={2}
          mb="2"
          color="teal.400"
        >
          {course.title}
        </chakra.h3>
      </Box>
    </Box>
  );
}
