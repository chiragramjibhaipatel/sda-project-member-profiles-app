import { FieldName, useField, useInputControl } from "@conform-to/react";
import { Review, ReviewsWrapper as ReviewsWrapperType } from "~/zodschema/MemberProfileSchema";
import { BlockStack, Button, Card, InlineGrid, Text } from "@shopify/polaris";
import {DeleteIcon} from '@shopify/polaris-icons';


export default function ReviewsWrapper({ reviews }: { reviews: FieldName<ReviewsWrapperType | null | undefined> }) {
    const [reviewsMeta] = useField(reviews);
    const reviewsFieldSet = reviewsMeta.getFieldset();
    const ids = useInputControl(reviewsFieldSet.ids);
    const handleDeleteIds = (id: string) => {
        console.log("Will delete:", {id});
        if(Array.isArray(ids.value)) {
            console.log("Array:", ids.value);
            const remainingIds = ids.value.filter((_id) => _id !== id);
            console.log("Remaining IDs:", remainingIds);
            ids.change(remainingIds);
        } else{
            console.log("Not an array:", ids.value);
            // ids.change([]);
        }
    }

    const reviewsReviewsFieldSet = reviewsFieldSet.references.getFieldList();

    console.log("Current Reviews: ", ids.value );

    return (
        <BlockStack gap="400">
            <Text variant="headingMd" as="h3">Reviews</Text>
            {reviewsReviewsFieldSet.map((review) => {
                return <OneReview review={review.name} key={review.id} handleDeleteIds={handleDeleteIds} currentIds={ids.value} />
            })}
        </BlockStack>
    );
}

function OneReview({ review, handleDeleteIds, currentIds }: { review: FieldName<Review | null | undefined>, handleDeleteIds: (id: string) => void, currentIds: string[] }) {
    const [reviewMeta] = useField(review);
    const reviewFieldSet = reviewMeta.getFieldset();
    const id = useInputControl(reviewFieldSet.id);
    const reference = useInputControl(reviewFieldSet.reference);
    const reviewer = useInputControl(reviewFieldSet.reviewer);
    const link = useInputControl(reviewFieldSet.link);
    
    if(!id.value) {
        return null;
    }

    const isInCurrentIds = currentIds.includes(id.value);
    if(!isInCurrentIds) {
        return null;
    }

    return (
        <Card >
            <BlockStack gap="200">
                <InlineGrid columns="1fr auto">
                    <Text variant="bodyMd" as="p">
                        <strong>Reviewer:</strong> {reviewer.value}
                    </Text>
                    <Button
                    icon={DeleteIcon}
                    variant="tertiary"
                    onClick={() => handleDeleteIds(id.value)}
                    accessibilityLabel="Edit"
                    />
                </InlineGrid>
                <Text variant="bodyMd" as="p">
                    <strong>Reference:</strong> {reference.value}
                </Text>
                <Text variant="bodyMd" as="p">
                    <strong>Link:</strong> <a href={link.value} target="_blank" rel="noopener noreferrer">{link.value}</a>
                </Text>
            </BlockStack>
        </Card>
    );
}