"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIn } from "formik";
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
  FormMultiSelect,
  FormSelect,
  FormToggle,
} from "./shared/FormFields";
import { FormStepper } from "./shared/FormStepper";
import { getData } from "@/services/api/apiService";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { activeField, requiredString } from "./shared/validation";

type Values = {
  couponCode: string;
  image: string;
  discountType: string;
  discountValue: number | "";
  timeBased: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isUserSpecific: boolean;
  userIds: number[];
};

const initialValues: Values = {
  couponCode: "",
  image: "",
  discountType: "percentage",
  discountValue: "",
  timeBased: true,
  startDate: "",
  endDate: "",
  isActive: true,
  isUserSpecific: false,
  userIds: [],
};

const schema = Yup.object({
  couponCode: requiredString("Coupon code", 2, 50),
  image: Yup.string(),
  discountType: Yup.string().oneOf(["percentage", "fixed"]).required(),
  discountValue: Yup.number().min(0).required("Discount value is required"),
  timeBased: Yup.boolean(),
  startDate: Yup.string().when("timeBased", {
    is: true,
    then: (field) => field.required("Start date and time are required for a time-based coupon"),
    otherwise: (field) => field,
  }),
  endDate: Yup.string()
    .when("timeBased", {
      is: true,
      then: (field) => field.required("End date and time are required for a time-based coupon"),
      otherwise: (field) => field,
    })
    .test("end-after-start", "End date and time must be after the start date and time", function (value) {
      if (!this.parent.timeBased || !value || !this.parent.startDate) return true;
      return new Date(value).getTime() > new Date(this.parent.startDate).getTime();
    }),
  isActive: activeField,
  isUserSpecific: Yup.boolean(),
  userIds: Yup.array().of(Yup.number()),
});

const COUPON_STEPS = [
  { id: 1, label: "Coupon Details" },
  { id: 2, label: "Media Assets" },
  { id: 3, label: "Coupon Settings" },
] as const;

function toDatetimeLocal(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function fetchUsersForSelect() {
  try {
    const res = await getData("users", { pageNumber: 1, pageSize: 1000, column: "firstName", order: "ASC" });
    const rows = res.data?.rows ?? [];
    return rows.map((u: Record<string, unknown>) => ({
      label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || String(u.email),
      value: Number(u.id),
    }));
  } catch {
    return [];
  }
}

export function CouponForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [users, setUsers] = useState<Array<{ label: string; value: string | number }>>([]);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => {
      const userIds = Array.isArray(r.users)
        ? (r.users as Array<{ id: number }>).map((u) => u.id)
        : [];

      return {
        couponCode: String(r.couponCode ?? ""),
        image: String(r.image ?? ""),
        discountType: String(r.discountType ?? "percentage"),
        discountValue: Number(r.discountValue ?? 0),
        timeBased: Boolean(r.timeBased ?? true),
        startDate: toDatetimeLocal(r.startDate),
        endDate: toDatetimeLocal(r.endDate),
        isActive: Boolean(r.isActive ?? true),
        isUserSpecific: Boolean(r.isUserSpecific ?? userIds.length > 0),
        userIds,
      };
    },
    mapValuesToPayload: (v) => ({
      couponCode: v.couponCode.trim(),
      image: v.image || null,
      discountType: v.discountType,
      discountValue: Number(v.discountValue),
      timeBased: v.timeBased,
      isActive: v.isActive,
      isUserSpecific: v.isUserSpecific,
      ...(v.timeBased
        ? {
          startDate: new Date(v.startDate).toISOString(),
          endDate: new Date(v.endDate).toISOString(),
        }
        : {}),
      ...(v.isUserSpecific ? { userIds: v.userIds } : {}),
    }),
  });

  useEffect(() => {
    if (formik.values.isUserSpecific) {
      fetchUsersForSelect().then(setUsers);
    }
  }, [formik.values.isUserSpecific]);

  async function handleNextStep() {
    if (currentStep === 1) {
      const fields = [
        "couponCode",
        "discountType",
        "discountValue",
        ...(formik.values.timeBased ? ["startDate", "endDate"] : []),
      ];
      await Promise.all(
        fields.map((field) => formik.setFieldTouched(field, true)),
      );
      const errors = await formik.validateForm();
      if (fields.some((field) => getIn(errors, field))) return;
    }

    setCurrentStep((step) => Math.min(step + 1, COUPON_STEPS.length));
  }

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Coupon" : "Add Coupon"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormStepper
          steps={[...COUPON_STEPS]}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) setCurrentStep(step);
          }}
        />

        {currentStep === 1 && (
          <FormGrid>
            <FormInput formik={formik} name="couponCode" label="Coupon Code" required />
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
              required
            />
            <FormFullWidth>
              <FormCheckbox formik={formik} name="timeBased" label="Time Based" />
            </FormFullWidth>
            {formik.values.timeBased && (
              <>
                <FormDatePicker
                  formik={formik}
                  name="startDate"
                  label="Start Date/Time"
                  mode="datetime"
                  required
                />
                <FormDatePicker
                  formik={formik}
                  name="endDate"
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
              name="image"
              label="Coupon Image (6:1)"
              uploadPath={UPLOAD_PATHS.coupons}
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
              <FormCheckbox
                formik={formik}
                name="isUserSpecific"
                label="User Specific"
              />
            {formik.values.isUserSpecific && (
              <FormFullWidth>
                <FormMultiSelect
                  formik={formik}
                  name="userIds"
                  label="Users"
                  options={users}
                />
              </FormFullWidth>
            )}
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
          {currentStep < COUPON_STEPS.length ? (
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
                {formik.isSubmitting ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </AdminFormLayout>
  );
}
