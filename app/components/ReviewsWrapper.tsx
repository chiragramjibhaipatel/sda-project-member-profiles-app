import { FieldName, useField, useInputControl } from "@conform-to/react";
import { Review, ReviewsWrapper as ReviewsWrapperType } from "~/zodschema/MemberProfileSchema";
import { BlockStack, Text } from "@shopify/polaris";
export default function ReviewsWrapper({reviews}: {reviews: FieldName<ReviewsWrapperType | null | undefined>}){

    const [reviewsMeta] = useField(reviews);
    const reviewsFieldSet = reviewsMeta.getFieldset();
    const ids = useInputControl(reviewsFieldSet.ids);

    const reviewsReviewsFieldSet = reviewsFieldSet.references.getFieldList();
    

    console.log({ids: ids.value});    

  return (
    <BlockStack gap={"400"}>
      <Text variant={"headingMd"} as="h3">Reviews</Text>
      { reviewsReviewsFieldSet.map((review) => {
        return (
          <OneReview review={review.name} key={review.id} />
        );
      })}
    </BlockStack>
  );
}


function OneReview({review}: {review: FieldName<Review | null | undefined>}){
    const [reviewMeta] = useField(review);
    const reviewFieldSet = reviewMeta.getFieldset();
    const reviewer = useInputControl(reviewFieldSet.reviewer);
    const link = useInputControl(reviewFieldSet.link);
    return (
        <Text variant={"bodyMd"} as="p">
            Reviewer: {reviewer.value}
        </Text>
    );
}