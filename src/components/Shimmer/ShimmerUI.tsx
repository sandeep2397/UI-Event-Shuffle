import { ShimmerWrapper } from "./style";

interface Props {
  className: string;
}

const Shimmer = ({ className }: Props) => (
  <ShimmerWrapper className={className} />
);

export default Shimmer;
