import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

export const useCarousel = (params: any) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(params);
    
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
    };
    }, [emblaApi, onSelect]);
    
    return [
        emblaRef,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext
    ]
}