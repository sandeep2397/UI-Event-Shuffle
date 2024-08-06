import styled from "@emotion/styled";

import Shimmer from "./ShimmerUI";

interface Props {
  isLoading: boolean;
  title?: string;
  description?: string;
}

const CardWrapper = styled.div`
  width: 300px;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin: 16px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardImage = styled.div`
  width: 100%;
  height: 200px;
  background: #ccc;
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CardTitle = styled.div`
  height: 20px;
  width: 80%;
  background: #ccc;
  margin-bottom: 8px;
`;

const CardDescription = styled.div`
  height: 16px;
  width: 100%;
  background: #eee;
  margin-bottom: 8px;
`;

const ShimmerCard = ({ isLoading, title, description }: Props) => {
  return (
    <CardWrapper>
      {isLoading ? (
        <>
          <Shimmer className="image-shimmer" />
          <CardContent>
            <Shimmer className="title-shimmer" />
            <Shimmer className="description-shimmer" />
          </CardContent>
        </>
      ) : (
        <>
          <CardImage />
          <CardContent>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardContent>
        </>
      )}
    </CardWrapper>
  );
};

export default ShimmerCard;
