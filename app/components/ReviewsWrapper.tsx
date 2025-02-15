import { FieldName, getFormProps, useField, useInputControl } from "@conform-to/react";
import { Review, ReviewsWrapper as ReviewsWrapperType } from "~/zodschema/MemberProfileSchema";
import { BlockStack, Button, Card, FormLayout, InlineGrid, InlineStack, Modal, Text, TextContainer, TextField } from "@shopify/polaris";
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { useState } from "react";
import { useCallback } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ReviewSchema } from "~/zodschema/MemberProfileSchema";
import { Form, useActionData, useFetcher, useNavigation, useParams } from "@remix-run/react";
import {action as ReviewAction} from "~/routes/members.$handle.reviews.$review-id";
export default function ReviewsWrapper({ reviews }: { reviews: FieldName<ReviewsWrapperType | null | undefined> }) {
    const [reviewsMeta] = useField(reviews);
    const reviewsFieldSet = reviewsMeta.getFieldset();
    const ids = useInputControl(reviewsFieldSet.ids);
    const handleDeleteIds = (id: string) => {
        console.log("Will delete:", { id });
        if (Array.isArray(ids.value)) {
            console.log("Array:", ids.value);
            const remainingIds = ids.value.filter((_id) => _id !== id);
            console.log("Remaining IDs:", remainingIds);
            ids.change(remainingIds);
        } else {
            console.log("Not an array:", ids.value);
            // ids.change([]);
        }
    }

    const reviewsReviewsFieldSet = reviewsFieldSet.references.getFieldList();


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

    if (!id.value) {
        return null;
    }

    const isInCurrentIds = currentIds.includes(id.value);
    if (!isInCurrentIds) {
        return null;
    }

    const handleEditReview = () => {
        console.log("Edit review:", id.value);
    }
    return (
        <Card >
            <BlockStack gap="200">
                <InlineGrid columns="1fr auto auto">
                    <Text variant="bodyMd" as="p">
                        <strong>Reviewer:</strong> {reviewer.value}
                    </Text>
                    <EditReviewModal id={id.value} reference={reference.value} reviewer={reviewer.value} link={link.value}/>
                    <Button
                        icon={DeleteIcon}
                        variant="tertiary"
                        onClick={() => handleDeleteIds(id.value)}
                        accessibilityLabel="Delete"
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

function EditReviewModal(review: {id: string, reference: string | undefined, reviewer: string | undefined, link: string | undefined}) {
    const [active, setActive] = useState(false);
    const fetcher = useFetcher<typeof ReviewAction>();
    const navigation = useNavigation();
    const { handle } = useParams();

    const [form, fields] = useForm({
        id: `edit-review-modal-${review.id}`,
        defaultValue: {
            id: review.id,
            reference: review.reference,
            reviewer: review.reviewer,
            link: review.link
        },
        lastResult: navigation.state === 'idle' ? fetcher.data : undefined,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: ReviewSchema });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
        
    });

    const id = useInputControl(fields.id);
    const reference = useInputControl(fields.reference);
    const reviewer = useInputControl(fields.reviewer);
    const link = useInputControl(fields.link);

    const handleChange = useCallback(() => {
        setActive(!active)
    }, [active, form.onSubmit]);

    const handleCancel = useCallback(() => {
        form.reset();
        setActive(false);
    }, [setActive, form]);
  
    const activator = <Button onClick={handleChange} icon={EditIcon} variant="tertiary" accessibilityLabel="Edit"></Button>;

    const handleSave = useCallback(() => {
        const formData = new FormData();
        formData.append("reviewId", review.id);
        formData.append("reference", reference.value || "");
        formData.append("reviewer", reviewer.value || "");
        formData.append("link", link.value || "");
        console.log("Form Data:", formData);
        fetcher.submit(formData, {
            method: "POST",
            action: `/members/${handle}/reviews/${encodeURIComponent(review.id)}`
        });
    }, [form]);
  
    return (
          <Modal
            activator={activator}
            open={active}
            onClose={handleChange}
            title="Edit Review"
            
            
          >
            <Modal.Section>
                <Form method={"POST"} action={`/members/reviews/${encodeURIComponent(review.id)}`} {...getFormProps(form)} onSubmit={form.onSubmit}>
                    <FormLayout>
                        <TextField
                            label="Reference"
                            name={fields.reference.name}
                            value={reference.value}
                            onChange={reference.change}
                            autoComplete="off"
                            error={fields.reference.errors}
                        />
                        <TextField
                            label="Reviewer"
                            name={fields.reviewer.name}
                            value={reviewer.value}
                            onChange={reviewer.change}
                            autoComplete="off"
                            error={fields.reviewer.errors}
                        />
                        <TextField
                            label="Link"
                            name={fields.link.name}
                            value={link.value}
                            onChange={link.change}
                            autoComplete="off"
                            error={fields.link.errors}
                        />
                    <InlineStack align="end" gap="200">
                        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>Save</Button>
                    </InlineStack>
                    </FormLayout>
                </Form>
              
              
            </Modal.Section>
          </Modal>
    );
  }
  