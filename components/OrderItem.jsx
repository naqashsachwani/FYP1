'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const [ratingModal, setRatingModal] = useState(null);

  const { ratings } = useSelector((state) => state.rating);

  return (
    <>
      <tr className="text-sm">
        <td className="text-left">
          <div className="flex flex-col gap-6">
            {order?.orderItems?.map((item, index) => {
              const mainImage =
                item?.product?.images?.[0] || "/placeholder.png";

              const existingRating = ratings?.find(
                (rating) =>
                  order?.id === rating?.orderId &&
                  item?.product?.id === rating?.productId
              );

              return (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-slate-100 pb-3"
                >
                  <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md overflow-hidden">
                    <Image
                      className="object-cover h-14 w-auto"
                      src={mainImage}
                      alt={item?.product?.name || "Product image"}
                      width={56}
                      height={56}
                    />
                  </div>

                  <div className="flex flex-col justify-center text-sm">
                    <p className="font-medium text-slate-700 text-base">
                      {item?.product?.name || "Unknown Product"}
                    </p>
                    <p className="text-slate-600">
                      {currency}
                      {item?.price?.toFixed(2) || "0.00"} × {item?.quantity || 0}
                    </p>
                    <p className="text-xs text-slate-400 mb-1">
                      {new Date(order?.createdAt).toDateString()}
                    </p>

                    <div>
                      {existingRating ? (
                        <Rating value={existingRating.rating} />
                      ) : (
                        order?.status === "DELIVERED" && (
                          <button
                            onClick={() =>
                              setRatingModal({
                                orderId: order?.id,
                                productId: item?.product?.id,
                              })
                            }
                            className="text-blue-600 hover:bg-blue-50 transition text-sm font-medium"
                          >
                            Rate Product
                          </button>
                        )
                      )}
                    </div>

                    {ratingModal && (
                      <RatingModal
                        ratingModal={ratingModal}
                        setRatingModal={setRatingModal}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </td>

        <td className="text-center max-md:hidden">
          {currency}
          {order?.total?.toFixed(2)}
        </td>

        <td className="text-left max-md:hidden">
          <p>{order?.address?.name}, {order?.address?.street}</p>
          <p>
            {order?.address?.city}, {order?.address?.state},{" "}
            {order?.address?.zip}, {order?.address?.country}
          </p>
          <p>{order?.address?.phone}</p>
        </td>

        <td className="text-left space-y-2 text-sm max-md:hidden">
          <div
            className={`flex items-center justify-center gap-1 rounded-full p-1 w-fit px-3 ${
              order?.status === "CONFIRMED"
                ? "text-yellow-500 bg-yellow-100"
                : order?.status === "DELIVERED"
                ? "text-green-600 bg-green-100"
                : "text-slate-500 bg-slate-100"
            }`}
          >
            <DotIcon size={10} />
            {order?.status?.replace(/_/g, " ").toLowerCase()}
          </div>
        </td>
      </tr>

      {/* Mobile layout */}
      <tr className="md:hidden">
        <td colSpan={5}>
          <div className="mt-3 text-sm text-slate-700">
            <p>{order?.address?.name}, {order?.address?.street}</p>
            <p>
              {order?.address?.city}, {order?.address?.state},{" "}
              {order?.address?.zip}, {order?.address?.country}
            </p>
            <p>{order?.address?.phone}</p>
          </div>

          <div className="flex items-center mt-2">
            <span className="text-center mx-auto px-6 py-1.5 rounded bg-blue-100 text-blue-700 font-medium">
              {order?.status?.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>
        </td>
      </tr>

      <tr>
        <td colSpan={4}>
          <div className="border-b border-slate-300 w-11/12 mx-auto" />
        </td>
      </tr>
    </>
  );
};

export default OrderItem;
