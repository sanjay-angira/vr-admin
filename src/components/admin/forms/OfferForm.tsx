"use client";

import { useRouter } from "next/navigation";
import { getIn } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { Button } from "@/components/common/Button";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormCheckbox,
  FormDatePicker,
  FormFullWidth,
  FormGrid,
  FormImageUpload,
  FormInput,
  FormSelect,
  FormToggle,
} from "./shared/FormFields";
import { FormStepper } from "./shared/FormStepper";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { activeField, requiredString } from "./shared/validation";

type Values = {
  offerName: string;
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  discountType: string;
  discountValue: number | "";
  startDateTime: string;
  endDateTime: string;
  timeBased: boolean;
  isActive: boolean;
  useAsHeroBanner: boolean;
};

const initialValues: Values = {
  offerName: "",
  desktopImage: "",
  tabletImage: "",
  mobileImage: "",
  discountType: "percentage",
  discountValue: "",
  startDateTime: "",
  endDateTime: "",
  timeBased: false,
  isActive: true,
  useAsHeroBanner: false,
};

const OFFER_STEPS = [
  { id: 1, label: "Offer Details" },
  { id: 2, label: "Media Assets" },
  { id: 3, label: "Offer Settings" },
] as const;

const schema = Yup.object({
  offerName: requiredString("Offer name", 2, 250),
  desktopImage: Yup.string(),
  tabletImage: Yup.string(),
  mobileImage: Yup.string(),
  discountType: Yup.string()
    .oneOf(["percentage", "fixed"])
    .required("Discount type is required"),
  discountValue: Yup.number().moreThan(0).required("Discount value is required"),
  startDateTime: Yup.string().when("timeBased", {
    is: true,
    then: (field) => field.required("Start date is required for a time-based offer"),
    otherwise: (field) => field,
  }),
  endDateTime: Yup.string()
    .when("timeBased", {
      is: true,
      then: (field) => field.required("End date is required for a time-based offer"),
      otherwise: (field) => field,
    })
    .test("end-after-start", "End date must be after the start date", function (value) {
      if (!this.parent.timeBased || !value || !this.parent.startDateTime) return true;
      return new Date(value).getTime() > new Date(this.parent.startDateTime).getTime();
    }),
  timeBased: Yup.boolean(),
  isActive: activeField,
  useAsHeroBanner: Yup.boolean(),
});

export function OfferForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      offerName: String(r.offerName ?? ""),
      desktopImage: String(r.desktopImage ?? r.image ?? ""),
      tabletImage: String(r.tabletImage ?? ""),
      mobileImage: String(r.mobileImage ?? ""),
      discountType: String(r.discountType ?? r.type ?? "percentage"),
      discountValue: Number(r.discountValue ?? 0),
      startDateTime: r.startDate ? String(r.startDate).slice(0, 16) : "",
      endDateTime: r.endDate ? String(r.endDate).slice(0, 16) : "",
      timeBased: Boolean(r.timeBased ?? false),
      isActive: Boolean(r.isActive ?? true),
      useAsHeroBanner: Boolean(r.useAsHeroBanner ?? false),
    }),
    mapValuesToPayload: (v) => ({
      offerName: v.offerName,
      desktopImage: v.desktopImage || null,
      tabletImage: v.tabletImage || null,
      mobileImage: v.mobileImage || null,
      discountType: v.discountType,
      discountValue: Number(v.discountValue),
      timeBased: v.timeBased,
      isActive: v.isActive,
      useAsHeroBanner: v.useAsHeroBanner,
      ...(v.timeBased
        ? {
          startDate: v.startDateTime ? new Date(v.startDateTime).toISOString() : null,
          endDate: v.endDateTime ? new Date(v.endDateTime).toISOString() : null,
        }
        : {}),
    }),
  });

  async function handleNextStep() {
    if (currentStep === 1) {
      const fields = [
        "offerName",
        "discountType",
        "discountValue",
        ...(formik.values.timeBased ? ["startDateTime", "endDateTime"] : []),
      ];
      await Promise.all(
        fields.map((field) => formik.setFieldTouched(field, true)),
      );
      const errors = await formik.validateForm();
      if (fields.some((field) => getIn(errors, field))) return;
    }

    setCurrentStep((step) => Math.min(step + 1, OFFER_STEPS.length));
  }

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Offer" : "Add Offer"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormStepper
          steps={[...OFFER_STEPS]}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) setCurrentStep(step);
          }}
        />

        {currentStep === 1 && (
          <FormGrid>
            <FormInput formik={formik} name="offerName" label="Offer Name" required />
            <FormSelect
              formik={formik}
              name="discountType"
              label="Discount Type"
              required
              options={[
                { label: "Percentage", value: "percentage" },
                { label: "Fixed", value: "fixed" },
              ]}
            />
            <FormInput
              formik={formik}
              name="discountValue"
              label="Discount Value"
              type="number"
              min="0.01"
              required
            />
            <FormFullWidth>
              <FormCheckbox formik={formik} name="timeBased" label="Time Based" />
            </FormFullWidth>
            {formik.values.timeBased && (
              <>
                <FormDatePicker
                  formik={formik}
                  name="startDateTime"
                  label="Start Date/Time"
                  mode="datetime"
                  required
                />
                <FormDatePicker
                  formik={formik}
                  name="endDateTime"
                  label="End Date/Time"
                  mode="datetime"
                  required
                />
              </>
            )}
          </FormGrid>
        )}

        {currentStep === 2 && (
          <FormGrid>
            <FormImageUpload
              formik={formik}
              name="desktopImage"
              label="Desktop Offer Image (3:1, max 1920px)"
              uploadPath={UPLOAD_PATHS.offers}
              imageType="offer_desktop"
              previewMode="full"
            />
            <FormImageUpload
              formik={formik}
              name="tabletImage"
              label="Tablet Offer Image (2:1, max 1200px)"
              uploadPath={UPLOAD_PATHS.offers}
              imageType="offer_tablet"
              previewMode="full"
            />
            <FormImageUpload
              formik={formik}
              name="mobileImage"
              label="Mobile Offer Image (3:2, max 800px)"
              uploadPath={UPLOAD_PATHS.offers}
              imageType="offer_mobile"
              previewMode="full"
            />
          </FormGrid>
        )}

        {currentStep === 3 && (
          <FormGrid>
            <FormToggle
              formik={formik}
              name="isActive"
              label="Active"
            />
            <FormToggle
              formik={formik}
              name="useAsHeroBanner"
              label="Use as Hero Banner"
            />
          </FormGrid>
        )}

        <div className={`flex pt-6 ${currentStep === 1 ? "justify-end" : "justify-between"}`}>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentStep((step) => step - 1)}
            >
              Previous
            </Button>
          )}
          {currentStep < OFFER_STEPS.length ? (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/${module}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? "Saving..." : isEdit ? "Update Offer" : "Create Offer"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </AdminFormLayout>
  );
}
