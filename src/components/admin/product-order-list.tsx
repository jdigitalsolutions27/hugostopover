"use client";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LoaderCircle, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProductOrderAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/domain";
export function ProductOrderList({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function ended(event: DragEndEvent) {
    if (event.over && event.active.id !== event.over.id) {
      setItems((current) => {
        const old = current.findIndex((p) => p.id === event.active.id);
        const next = current.findIndex((p) => p.id === event.over?.id);
        return arrayMove(current, old, next);
      });
    }
  }
  function save() {
    startTransition(async () => {
      try {
        await updateProductOrderAction(items.map((p) => p.id));
        toast.success("Product order saved.");
      } catch {
        toast.error("Product order could not be saved.");
      }
    });
  }
  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={ended}
      >
        <SortableContext
          items={items.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((product, index) => (
              <SortableProduct
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="border-cocoa/10 sticky bottom-4 mt-5 flex justify-end rounded-2xl border bg-white/90 p-4 shadow-xl backdrop-blur">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save order
        </Button>
      </div>
    </div>
  );
}
function SortableProduct({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`paper-card flex items-center gap-4 p-4 ${isDragging ? "z-20 opacity-60 shadow-2xl" : ""}`}
    >
      <button
        type="button"
        className="bg-beige/40 text-muted grid size-10 cursor-grab place-items-center rounded-xl active:cursor-grabbing"
        aria-label={`Move ${product.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>
      <span className="text-muted w-6 text-center text-xs font-extrabold">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-cocoa truncate text-sm font-extrabold">
          {product.name}
        </p>
        <p className="text-muted mt-1 text-xs">{product.category?.name}</p>
      </div>
      <span className="text-ube text-xs font-bold capitalize">
        {product.status}
      </span>
    </div>
  );
}
