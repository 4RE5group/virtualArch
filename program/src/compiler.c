#include "virtualArch.h"
#include <ctype.h>
#include <stdint.h>

#define MAX_LABELS 256
#define RAM_SIZE 20000

typedef struct s_label
{
	char		name[128];
	uint16_t	address;
} t_label;

static void trim(char *s)
{
	size_t start = 0;
	size_t end = strlen(s);

	while (start < end && isspace((unsigned char)s[start]))
		start++;
	while (end > start && isspace((unsigned char)s[end - 1]))
		end--;
	memmove(s, s + start, end - start);
	s[end - start] = '\0';
}

static void uppercase(char *s)
{
	for (; *s; s++)
		*s = (char)toupper((unsigned char)*s);
}

static int find_label(t_label *labels, size_t count, const char *name)
{
	size_t i;

	for (i = 0; i < count; i++)
		if (strcmp(labels[i].name, name) == 0)
			return (int)labels[i].address;
	return -1;
}

static int parse_number(char *value, t_label *labels, size_t label_count,
						uint16_t *number)
{
	char *end;
	long parsed;
	int label;

	trim(value);
	uppercase(value);
	if (strcmp(value, "CURSOR") == 0)
		parsed = RAM_SIZE - 3;
	else if (strcmp(value, "WRITE") == 0)
		parsed = RAM_SIZE - 2;
	else if (strcmp(value, "KEYPRESS") == 0)
		parsed = RAM_SIZE;
	else if (strcmp(value, "COLOR_BG") == 0)
		parsed = RAM_SIZE - 14;
	else if (strcmp(value, "COLOR_FG") == 0)
		parsed = RAM_SIZE - 13;
	else if (strncmp(value, "TMP", 3) == 0 && value[3] >= '0' && value[3] <= '6'
			&& value[4] == '\0')
		parsed = RAM_SIZE - 10 + (value[3] - '0');
	else
	{
		label = find_label(labels, label_count, value);
		if (label >= 0)
		{
			*number = (uint16_t)label;
			return 0;
		}
		parsed = strtol(value, &end, 0);
		if (end == value || *end != '\0')
			return -1;
	}
	if (parsed < 0 || parsed > 32767)
		return -1;
	*number = (uint16_t)parsed;
	return 0;
}

static int parse_operand(char *operand, t_label *labels, size_t label_count, uint16_t *value)
{
	size_t len = strlen(operand);
	char decoded;

	trim(operand);
	len = strlen(operand);
	if (len >= 3 && operand[0] == '\'' && operand[len - 1] == '\'')
	{
		if (len == 3)
			decoded = operand[1];
		else if (len == 4 && operand[1] == '\\')
		{
			if (operand[2] == 'n') decoded = '\n';
			else if (operand[2] == 'r') decoded = '\r';
			else if (operand[2] == 't') decoded = '\t';
			else if (operand[2] == '0') decoded = '\0';
			else decoded = operand[2];
		}
		else
			return -1;
		*value = (uint16_t)(unsigned char)decoded;
		return 0;
	}
	return parse_number(operand, labels, label_count, value);
}

static int register_id(const char *term)
{
	if (strcmp(term, "D") == 0) return 1;
	if (strcmp(term, "A") == 0) return 2;
	if (strcmp(term, "*A") == 0) return 3;
	if (strcmp(term, "0") == 0) return 4;
	if (strcmp(term, "1") == 0) return 5;
	return 0;
}

static int encode(char *line, t_label *labels, size_t label_count, uint16_t *word)
{
	char destination[32] = "";
	char operation[160];
	char condition[16] = "";
	char *equal = strchr(line, '=');
	char *semi;
	char *operator_at = NULL;
	char *left, *right;
	int dest = 0, u = 0, op1 = 0, op0 = 0, zx = 0, sw = 0, pointer = 0;
	int lhs, rhs;
	uint16_t immediate;

	if (equal)
	{
		*equal = '\0';
		strncpy(destination, line, sizeof(destination) - 1);
		trim(destination);
		strncpy(operation, equal + 1, sizeof(operation) - 1);
	}
	else
		strncpy(operation, line, sizeof(operation) - 1);
	operation[sizeof(operation) - 1] = '\0';
	trim(operation);
	uppercase(operation);
	semi = strchr(operation, ';');
	if (semi)
	{
		*semi = '\0';
		strncpy(condition, semi + 1, sizeof(condition) - 1);
		trim(condition);
	}
	trim(operation);
	if (destination[0])
	{
		if (strcmp(destination, "A") == 0) dest = 4;
		else if (strcmp(destination, "D") == 0) dest = 2;
		else if (strcmp(destination, "*A") == 0) dest = 1;
		else if (strcmp(destination, "A, D") == 0 || strcmp(destination, "D, A") == 0) dest = 6;
		else if (strcmp(destination, "A, *A") == 0 || strcmp(destination, "*A, A") == 0) dest = 5;
		else if (strcmp(destination, "D, *A") == 0 || strcmp(destination, "*A, D") == 0) dest = 3;
		else if (strcmp(destination, "A, D, *A") == 0 || strcmp(destination, "A, *A, D") == 0
				|| strcmp(destination, "D, A, *A") == 0 || strcmp(destination, "D, *A, A") == 0
				|| strcmp(destination, "*A, A, D") == 0 || strcmp(destination, "*A, D, A") == 0) dest = 7;
		else return -1;
	}
	if (!condition[0] && strcmp(destination, "A") == 0
		&& parse_operand(operation, labels, label_count, &immediate) == 0)
	{
		*word = immediate;
		return 0;
	}
	if (!operation[0]) return -1;
	if (strcmp(operation, "0") == 0 || strcmp(operation, "1") == 0)
	{
		zx = 1;
		if (operation[0] == '1') { u = 1; op0 = 1; }
		goto calculate;
	}
	if (strchr(operation, '+')) { u = 1; operator_at = strchr(operation, '+'); }
	else if (strchr(operation, '-')) { u = 1; op1 = 1; operator_at = strchr(operation, '-'); }
	else if (strchr(operation, '&')) operator_at = strchr(operation, '&');
	else if (strchr(operation, '|')) { op0 = 1; operator_at = strchr(operation, '|'); }
	else if (strchr(operation, '^')) { op1 = 1; operator_at = strchr(operation, '^'); }
	else if (operation[0] == '~')
	{
		op1 = 1; op0 = 1;
		if (strcmp(operation + 1, "D") == 0) { lhs = 1; rhs = 0; }
		else if (strcmp(operation + 1, "A") == 0) { lhs = 2; rhs = 0; sw = 1; }
		else if (strcmp(operation + 1, "*A") == 0) { lhs = 3; rhs = 0; sw = 1; pointer = 1; }
		else return -1;
		goto calculate;
	}
	if (!operator_at)
	{
		if (strcmp(operation, "D") == 0) { strcpy(operation, "D+0"); u=1; operator_at=strchr(operation,'+'); }
		else if (strcmp(operation, "A") == 0 || strcmp(operation, "*A") == 0)
		{ char copy[160]; strcpy(copy, operation); snprintf(operation, sizeof(operation), "0+%s", copy); u=1; operator_at=strchr(operation,'+'); }
		else return -1;
	}
	*operator_at = '\0';
	left = operation;
	right = operator_at + 1;
	trim(left); trim(right);
	lhs = register_id(left); rhs = register_id(right);
	if (!lhs || !rhs) return -1;
	if (lhs == 4) zx = 1;
	if (rhs == 4) { zx = 1; sw = 1; }
	if (u && lhs == 5) { op0=1; sw=1; }
	else if (u && rhs == 5) op0=1;
	if ((lhs == 1 || lhs == 4 || (lhs == 5 && u)) && (rhs == 4 || rhs == 2 || rhs == 3 || (rhs == 5 && u)))
		pointer = (rhs == 3);
	else if ((lhs == 4 || lhs == 2 || lhs == 3 || (lhs == 5 && u)) && (rhs == 1 || rhs == 4 || (rhs == 5 && u)))
	{ sw = 1; pointer = (lhs == 3); }
	else return -1;
calculate:
	*word = (uint16_t)(0x8000 | (dest << 3) | (u << 10) | (op1 << 9)
			| (op0 << 8) | (zx << 7) | (sw << 6) | (pointer << 12));
	if (condition[0])
	{
		int jump = 0;
		if (strcmp(condition,"JMP")==0) jump=7;
		else if (strcmp(condition,"JNE")==0) jump=5;
		else if (strcmp(condition,"JLT")==0) jump=4;
		else if (strcmp(condition,"JLE")==0) jump=6;
		else if (strcmp(condition,"JEQ")==0) jump=2;
		else if (strcmp(condition,"JGT")==0) jump=1;
		else if (strcmp(condition,"JGE")==0) jump=3;
		else return -1;
		*word |= (uint16_t)jump;
	}
	return 0;
}

int assemble(char *file_content, size_t file_size, uint16_t **opcodes, size_t *opcode_count)
{
	t_label labels[MAX_LABELS];
	uint16_t *words;
	char *copy, *scan, *line, *next;
	size_t label_count = 0, instruction_count = 0, line_number = 0;
	int in_text = 0;

	*opcodes = NULL;
	*opcode_count = 0;
	copy = malloc(file_size + 1);
	if (!copy) { perror("malloc"); return 1; }
	memcpy(copy, file_content, file_size);
	copy[file_size] = '\0';
	scan = malloc(file_size + 1);
	if (!scan) { perror("malloc"); free(copy); return 1; }
	memcpy(scan, copy, file_size + 1);
	line = scan;
	while (line < scan + file_size)
	{
		next = strpbrk(line, "\r\n");
		if (next) *next = '\0';
		line_number++;
		{
			char *comment = strchr(line, '#');
			if (comment) *comment = '\0';
			trim(line);
			if (*line)
			{
				if (strcmp(line, "TEXT:") == 0) in_text = 1;
				else if (strcmp(line, "MAIN:") == 0) in_text = 0;
				else if (in_text) { fprintf(stderr, "compile: TEXT data is not supported (line %zu)\n", line_number); free(scan); free(copy); return 1; }
				else if (line[strlen(line)-1] == ':')
				{
					line[strlen(line)-1] = '\0'; trim(line); uppercase(line);
					if (label_count == MAX_LABELS || find_label(labels, label_count, line) >= 0 || instruction_count > 32767)
					{ fprintf(stderr, "compile: invalid or duplicate label at line %zu\n", line_number); free(scan); free(copy); return 1; }
					strncpy(labels[label_count].name, line, sizeof(labels[label_count].name)-1);
					labels[label_count].name[sizeof(labels[label_count].name)-1] = '\0';
					labels[label_count++].address = (uint16_t)instruction_count;
				}
				else instruction_count++;
			}
		}
		if (!next) break;
		line = next + 1;
		if (*next == '\r' && *line == '\n') line++;
	}
	free(scan);
	words = calloc(instruction_count ? instruction_count : 1, sizeof(*words));
	if (!words) { perror("calloc"); free(copy); return 1; }
	line = copy; instruction_count = 0; line_number = 0; in_text = 0;
	while (line < copy + file_size)
	{
		next = strpbrk(line, "\r\n");
		if (next) *next = '\0';
		line_number++;
		{
			char *comment = strchr(line, '#');
			uint16_t word;
			if (comment) *comment = '\0';
			trim(line);
			if (*line)
			{
				if (strcmp(line, "TEXT:") == 0) in_text = 1;
				else if (strcmp(line, "MAIN:") == 0) in_text = 0;
				else if (!in_text && line[strlen(line)-1] != ':')
				{
					if (encode(line, labels, label_count, &word) != 0)
					{ fprintf(stderr, "compile: invalid instruction at line %zu\n", line_number); free(words); free(copy); return 1; }
					words[instruction_count++] = word;
				}
			}
		}
		if (!next) break;
		line = next + 1;
		if (*next == '\r' && *line == '\n') line++;
	}
	*opcodes = words;
	*opcode_count = instruction_count;
	free(copy);
	return 0;
}

int compile(char *file_content, size_t file_size)
{
	uint16_t *opcodes;
	size_t opcode_count, i;

	if (assemble(file_content, file_size, &opcodes, &opcode_count) != 0)
		return 1;
	printf("[");
	for (i = 0; i < opcode_count; i++)
		printf("%s%u", i ? ", " : "", (unsigned)opcodes[i]);
	printf("]\n");
	free(opcodes);
	return 0;
}
