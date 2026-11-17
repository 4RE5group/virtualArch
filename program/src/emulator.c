#include "virtualArch.h"
#include <stdint.h>

#define RAM_SIZE			20000
#define MAX_INSTRUCTIONS	100000
#define MAX_OUTPUT_CHARS	80

static int32_t read_memory(const int32_t *memory, int32_t address)
{
	if (address < 0 || address >= RAM_SIZE)
		return 0;
	return memory[address];
}

static void print_character(uint16_t character)
{
	if (character >= 0x20 && character <= 0x7e)
		putchar((unsigned char)character);
	else
		putchar('?');
}

static void write_memory(int32_t *memory, int32_t address, int32_t value, int32_t d_register, size_t *output_count)
{
	uint16_t character;

	if (address == RAM_SIZE - 2)
	{
		if (*output_count >= MAX_OUTPUT_CHARS)
			return;
		character = (uint16_t)d_register;
		print_character(character);
		(*output_count)++;
	}
	else if (address >= 0 && address < RAM_SIZE)
		memory[address] = value;
}

int emulate(const uint16_t *opcodes, size_t opcode_count)
{
	int32_t *memory;
	int32_t a_register = 0, d_register = 0, output;
	size_t pc = 0, steps = 0, output_count = 0;
	int truncated = 0;

	if (!opcodes && opcode_count != 0)
	{
		fprintf(stderr, "emulate: opcode list is null\n");
		return 1;
	}
	memory = calloc(RAM_SIZE, sizeof(*memory));
	if (!memory)
	{
		perror("calloc");
		return 1;
	}
	memory[RAM_SIZE - 13] = 0xff;
	while (pc < opcode_count && steps < MAX_INSTRUCTIONS)
	{
		uint16_t opcode = opcodes[pc++];
		uint32_t calculation;
		int destination, condition, left, right, u, op1, op0, zx, sw;
		int32_t left_term, right_term;

		steps++;
		if ((opcode & 0x8000) == 0)
		{
			a_register = opcode & 0x7fff;
			continue;
		}
		destination = (opcode >> 3) & 7;
		condition = opcode & 7;
		calculation = (opcode >> 6) & 0x1f;
		u = (calculation >> 4) & 1;
		op1 = (calculation >> 3) & 1;
		op0 = (calculation >> 2) & 1;
		zx = (calculation >> 1) & 1;
		sw = calculation & 1;
		left_term = d_register;
		right_term = (opcode & (1 << 12)) ? read_memory(memory, a_register) : a_register;
		if (zx)
		{
			if (sw) right_term = 0;
			else left_term = 0;
		}
		if (u && op0)
		{
			if (sw) left_term = 1;
			else right_term = 1;
		}
		if (sw)
		{
			int32_t temporary = left_term;
			left_term = right_term;
			right_term = temporary;
		}
		if (u)
			output = op1 ? left_term - right_term : left_term + right_term;
		else if (op1)
			output = op0 ? ~left_term : left_term ^ right_term;
		else
			output = op0 ? left_term | right_term : left_term & right_term;
		if (destination & 4)
			a_register = output;
		if (destination & 1)
			write_memory(memory, a_register, output, d_register, &output_count);
		if (destination & 2)
			d_register = output;
		left = (condition & 4) && output < 0;
		right = (condition & 2) && output == 0;
		if (left || right || ((condition & 1) && output > 0))
		{
			if (a_register < 0 || (uint32_t)a_register > opcode_count)
				pc = opcode_count;
			else
				pc = (size_t)a_register;
		}
		if (output_count >= MAX_OUTPUT_CHARS)
		{
			truncated = 1;
			break;
		}
	}
	if (output_count > 0)
		putchar('\n');
	if (truncated)
		fprintf(stderr, "emulate: output stopped after %d characters\n", MAX_OUTPUT_CHARS);
	else if (steps == MAX_INSTRUCTIONS && pc < opcode_count)
		fprintf(stderr, "emulate: stopped after %d instructions (possible infinite loop)\n",
				MAX_INSTRUCTIONS);
	free(memory);
	return 0;
}
