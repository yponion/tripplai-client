"use client";

import { Box, Image, useColorModeValue, chakra, Badge, Flex, Tooltip } from "@chakra-ui/react";
import { Course, Destination } from "@/types";
import { getCityImage } from "@/utils/imageUtils";

interface Props {
  course: Course;
  destination: Destination;
  index?: number;
  onClick?: () => void;
}

export default function CourseCard({ course, destination, index, onClick }: Props) {
  const isNew = true;
  const handleKakaoShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const kakao: any = (window as any).Kakao;
      const pageUrl = `${window.location.origin}/travel/popular/${course.courseId}`;
      const imageUrl = destination.destinationThumbnailImageUrl || course.thumbnailUrl || '';
      if (kakao && kakao.isInitialized && kakao.isInitialized()) {
        kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: course.title,
            description: destination.destinationAddr1 || course.area,
            imageUrl: imageUrl || `${window.location.origin}/images/popular/map_pin.png`,
            link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
          },
          buttons: [
            { title: '자세히 보기', link: { mobileWebUrl: pageUrl, webUrl: pageUrl } },
          ],
        });
      } else if (navigator.share) {
        navigator.share({ title: course.title, text: '여행 코스 공유', url: pageUrl }).catch(() => {});
      } else {
        navigator.clipboard.writeText(pageUrl).catch(() => {});
      }
    } catch {}
  };

  return (
    <Box
      bg={useColorModeValue("white", "gray.700")}
      borderWidth="0"
      rounded="2xl"
      overflow="hidden"
      position="relative"
      minHeight="420px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      transition="box-shadow .2s, transform .2s, border-radius .2s"
      boxShadow="0 6px 18px rgba(0,0,0,0.08)"
      _hover={{ transform: "translateY(-4px)", boxShadow: "0 14px 32px rgba(0,0,0,0.14)" }}
    >
      {/* 썸네일: destination의 이미지 사용 */}
      <Box position="relative">
        <Image
        src={
          destination.destinationThumbnailImageUrl ||
          course.thumbnailUrl ||
          getCityImage(course.area)
        }
        alt={course.title}
        objectFit="cover"
          w="100%"
          h="240px"
          borderTopLeftRadius="16px"
          borderTopRightRadius="16px"
          fallbackSrc="/images/popular/map_pin.png"
        />
        {/* 좌상단 지역 뱃지 */}
        <Badge position="absolute" top="3" left="3" colorScheme="pink" rounded="full" px={3} py={1} fontWeight="600" boxShadow="0 2px 6px rgba(0,0,0,0.12)">
          {`#${course.area}`}
        </Badge>
        {/* 우상단 카카오 공유 로고 (프레임 없이 아이콘만) */}
        <Tooltip label="카카오톡으로 공유" hasArrow>
          <chakra.img
            src="/icons/kakao-talk.png"
            alt="카카오톡 공유"
            onClick={handleKakaoShare}
            position="absolute"
            top="10px"
            right="10px"
            width="36px"
            height="36px"
            cursor="pointer"
            style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.25))' }}
          />
        </Tooltip>
      </Box>
      {/* 카드 본문 */}
      <Box px="5" pt="4" pb="6">
        <chakra.h3
          fontSize="lg"
          fontWeight="700"
          noOfLines={2}
          mb="2"
          color={useColorModeValue('gray.900','white')}
        >
          {course.title}
        </chakra.h3>
        <chakra.p fontSize="sm" color="gray.600" noOfLines={1}>
          {destination.destinationAddr1 || destination.destinationName}
        </chakra.p>
      </Box>
    </Box>
  );
}
