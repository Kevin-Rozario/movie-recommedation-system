import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  hasNextPage,
  onPageChange,
}) => {
  // Determine if the Previous button should be disabled
  const isPreviousDisabled = currentPage === 1;
  // Determine if the Next button should be disabled (based on App.tsx check)
  const isNextDisabled = !hasNextPage;

  return (
    <Pagination className="mb-6">
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem
          onClick={() => !isPreviousDisabled && onPageChange(currentPage - 1)}
        >
          <PaginationPrevious
            href="#"
            className={
              isPreviousDisabled
                ? "pointer-events-none opacity-50"
                : "cursor-pointer  hover:bg-red-700  hover:text-white text-white font-semibold py-2 px-4 border border-red-700 rounded-xl"
            }
          />
        </PaginationItem>

        {/* Current Page Indicator (Simple Text) */}
        <PaginationItem>
          <div className="px-4 py-2 text-sm font-medium text-gray-300">
            Page {currentPage}
          </div>
        </PaginationItem>

        {/* Next Button */}
        <PaginationItem
          onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
        >
          <PaginationNext
            href="#"
            className={
              isNextDisabled
                ? "pointer-events-none opacity-50"
                : "cursor-pointer hover:bg-red-700  hover:text-white text-white font-semibold py-2 px-4 border border-red-700 rounded-xl"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;
